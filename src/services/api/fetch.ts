import apiConfig from "@/lib/config/apiConfig";

interface IAPIResponse {
  success: boolean;
  status: number;
  data: any;
}

class FetchService {
  authStatusCodes: Array<number> = [401];
  authErrorURLs: Array<string> = [
    "/oauth/authorize",
    "/oauth/token",
  ];

  private _fetchType: string;

  /**
   * Get access token from localStorage
   */
  private getAccessToken(): string | null {
    return localStorage.getItem("access_token");
  }

  /**
   * Set access token in localStorage
   */
  private setAccessToken(token: string): void {
    localStorage.setItem("access_token", token);
  }

  /**
   * Remove access token from localStorage
   */
  private removeAccessToken(): void {
    localStorage.removeItem("access_token");
  }

  /**
   * Refresh access token using OAuth refresh token
   */
  public async refreshAccessToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) return null;

    try {
      const response = await fetch(
        `${apiConfig.app.BASE_URL}/oauth/refresh-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        }
      );

      if (!response.ok) throw new Error("Failed to refresh token");

      const result = await response.json();
      const newAccessToken = result?.access_token || result?.data?.access_token;

      if (newAccessToken) {
        this.setAccessToken(newAccessToken);
        return newAccessToken;
      }
      return null;
    } catch (err) {
      console.error("Token refresh failed:", err);
      return null;
    }
  }

  constructor(fetchTypeValue = "json") {
    this._fetchType = fetchTypeValue;
  }

  /**
   * Configure Authorization header with Bearer token
   */
  configureAuthorization(config: any) {
    const accessToken = this.getAccessToken();
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
  }

  setHeaderToEmpty(config: any) {
    config.headers = {};
  }

  setDefaultHeaders(config: any) {
    config.headers = {
      "Content-Type": "application/json",
    };
  }

  checkToLogOutOrNot(path: string) {
    return this.authErrorURLs.some((arrayUrl: string) =>
      path.includes(arrayUrl)
    );
  }

  isAuthRequest(path: string) {
    return this.authErrorURLs.includes(path);
  }

  async logout(response: Response) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (localStorage) {
      localStorage.setItem("auth_message", "Session Expired!");
      this.removeAccessToken();
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
    }
    
    indexedDB.databases().then((databases) => {
      databases.forEach((db) => {
        if (db.name) indexedDB.deleteDatabase(db.name);
      });
    });
    
    window.location.replace("/signin");
    throw {
      success: false,
      status: response.status,
      data: await response.json(),
    };
  }

  async hit(...args: Array<any>): Promise<IAPIResponse> {
    const [path, configInput, isEmptyHeader = false, signal] = args;

    // Create a clean copy of the config with signal added
    const config: RequestInit = {
      ...configInput,
      headers: configInput?.headers || {},
      signal,
    };

    // Set headers
    if (!isEmptyHeader) {
      this.setDefaultHeaders(config);
    } else {
      this.setHeaderToEmpty(config);
    }

    // Attach Authorization header
    if (!this.isAuthRequest(path)) {
      this.configureAuthorization(config);
    }

    const url = path.startsWith("http") ? path : apiConfig.app.BASE_URL + path;
    let response: Response;

    // Initial fetch with error handling
    try {
      response = await fetch(url, config);
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.warn("Request was aborted");
        throw err;
      }
      throw err;
    }

    // Handle 401 with token refresh
    if (response.status === 401 && !this.checkToLogOutOrNot(path)) {
      const responseData = await response.clone().json();
      
      // Check for specific error codes that should trigger logout
      if (responseData.error_code === "USER_REMOVED_FROM_WORKSPACE" || 
          responseData.error_code === "INVALID_TOKEN") {
        throw await this.logout(response);
      }

      const newToken = await this.refreshAccessToken();

      if (newToken) {
        this.configureAuthorization(config); // add new token
        try {
          response = await fetch(url, config);
        } catch (err: any) {
          if (err.name === "AbortError") {
            console.warn("Retry was aborted");
            throw err;
          }
          throw err;
        }

        if (!response.ok) {
          const error: any = new Error(response.statusText);
          error.data = await response.json();
          error.status = response.status;
          throw error;
        }
      } else {
        setTimeout(() => {
          localStorage.setItem("auth_message", "Session Expired!");
          this.removeAccessToken();
          window.location.replace("/signin");
        }, 3000);
        window.dispatchEvent(new Event("unauthorized"));
        throw {
          success: false,
          status: 401,
          data: await response.json(),
        };
      }
    }

    // Handle non-200 responses
    if (!response.ok) {
      if (
        this.authStatusCodes.includes(response.status) &&
        !this.checkToLogOutOrNot(path)
      ) {
        throw await this.logout(response);
      }

      const error: any = new Error(response.statusText);
      error.data = await response.json();
      error.status = response.status;
      throw error;
    }

    // Return final response
    if (this._fetchType === "response") {
      return {
        success: response.ok,
        status: response.status,
        data: response,
      };
    }

    return {
      success: true,
      status: response.status,
      data: await response.json(),
    };
  }

  async post(url: string, payload?: any, signal?: AbortSignal) {
    return await this.hit(
      url,
      {
        method: "POST",
        body: payload ? JSON.stringify(payload) : undefined,
      },
      false,
      signal
    );
  }

  async postFormData(url: string, formData?: FormData) {
    return await this.hit(
      url,
      {
        method: "POST",
        body: formData,
      },
      true
    );
  }

  async postURLEncoded(url: string, params: URLSearchParams | string) {
    const config: any = {
      method: "POST",
      body: params,
    };
    config.headers = {
      "Content-Type": "application/x-www-form-urlencoded",
    };
    return await this.hit(url, config, false);
  }

  async get(url: string, queryParams: Record<string, any> = {}) {
    if (Object.keys(queryParams).length) {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      url = `${url}?${params.toString()}`;
    }
    return await this.hit(url, {
      method: "GET",
    });
  }

  async delete(url: string, payload?: any) {
    return this.hit(url, {
      method: "DELETE",
      body: payload ? JSON.stringify(payload) : null,
    });
  }

  async deleteWithOutPayload(url: string) {
    return this.hit(url, {
      method: "DELETE",
    });
  }

  async put(url: string, payload?: any, signal?: AbortSignal) {
    return this.hit(
      url,
      {
        method: "PUT",
        body: payload ? JSON.stringify(payload) : null,
      },
      false,
      signal
    );
  }

  async patch(url: string, payload?: any) {
    return this.hit(url, {
      method: "PATCH",
      body: payload ? JSON.stringify(payload) : null,
    });
  }

  /**
   * Upload file to presigned URL (S3)
   */
  async uploadToPresignedUrl(presignedUrl: string, file: File): Promise<boolean> {
    const response = await fetch(presignedUrl, {
      method: "PUT",
      body: file,
      mode: "cors",
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    return true;
  }
}

export const $fetch = new FetchService();
export const $fetchResponse = new FetchService("response");