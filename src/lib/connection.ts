import { writable } from "svelte/store";

const connected = writable(false);

class Connection {
  url: string | null;
  accessKey: string | null;
  version: string | null = null;

  constructor() {
    this.url = localStorage.getItem("url");
    this.accessKey = localStorage.getItem("accessKey");
    this.connect();
  }

  async connect(): Promise<boolean> {
    if (!this.url) return false;

    const reqHeaders = new Headers();
    if (this.accessKey) reqHeaders.set("Access-Key", this.accessKey);

    try {
      const resp = await fetch(this.url.slice(0, -1), {
        headers: reqHeaders,
      });

      if (resp.ok) {
        const json = await resp.json();
        if (!json.supportedGenres) return false;

        this.version = json.version;

        connected.set(true);

        return true;
      }
    } catch {}

    return false;
  }

  async setConnectionInfo(
    url: string,
    accessKey: string | null
  ): Promise<boolean> {
    if (!url.match(/https?:\/\/.*/)) return false;
    this.url = url;
    if (!this.url.endsWith("/")) this.url += "/";

    this.accessKey = accessKey;
    this.save();

    return await this.connect();
  }

  disconnect() {
    this.url = null;
    this.accessKey = null;
    this.version = null;

    localStorage.removeItem("url");
    localStorage.removeItem("accessKey");

    window.location.reload();
  }

  save() {
    if (this.url) localStorage.setItem("url", this.url);

    if (this.accessKey) localStorage.setItem("accessKey", this.accessKey);
    else localStorage.removeItem("accessKey");
  }

  /**
   * A helper function to fetch data from the server.
   *
   * @async
   * @param method The method of the request. (required)
   * @param action The path of the request. (required)
   * @param params The parameters of the request. (default: {})
   * @param body The body of te request. (optional)
   * @param headers The headers of te request. (default: {})
   * @param handleError Determine whether it should handled for the error. (default: false)
   * @param checkServerDown Determine whether it should check if the server down before sending the request. (default: true)
   * @returns
   */
  async fetch(
    method: string,
    action: string,
    params: { [key: string]: string } = {},
    body: string | undefined = undefined,
    headers: { [key: string]: string } = {}
  ): Promise<Response> {
    if (this.accessKey) headers["Access-Key"] = this.accessKey;

    // send the requests
    let response: Response;
    try {
      response = await fetch(
        `${this.url}${action}${Object.keys(params).length === 0 ? "" : "?"}` +
          new URLSearchParams(params),
        {
          method: method,
          headers: new Headers(headers),
          body: body,
        }
      );
    } catch (e) {
      return Response.error();
    }

    return response;
  }

  /**
   * A helper function for GET.
   *
   * @async
   * @param action The path of the request. (required)
   * @param params The parameters of the request. (default: {})
   * @param headers The headers of te request. (default: {})
   */
  get = async (
    action: string,
    params: { [key: string]: string } = {},
    headers: { [key: string]: string } = {}
  ) => this.fetch("GET", action, params, undefined, headers);

  /**
   * A helper function for DELETE.
   *
   * @async
   * @param action The path of the request. (required)
   * @param params The parameters of the request. (default: {})
   * @param headers The headers of te request. (default: {})
   */
  delete = async (
    action: string,
    params: { [key: string]: string } = {},
    headers: { [key: string]: string } = {}
  ) => this.fetch("DELETE", action, params, undefined, headers);

  /**
   * A helper function for POST.
   *
   * @async
   * @param action The path of the request. (required)
   * @param params The parameters of the request. (default: {})
   * @param body The body of te request. (optional)
   * @param headers The headers of te request. (default: {})
   */
  post = async (
    action: string,
    params: { [key: string]: string } = {},
    body: Object | string | undefined = undefined,
    headers: { [key: string]: string } = {}
  ) => {
    let parsedBody = body;
    let parsedHeaders = headers;

    if (parsedBody && !(typeof parsedBody === "string")) {
      parsedBody = JSON.stringify(parsedBody);
      parsedHeaders["Content-Type"] = "application/json";
    }

    return this.fetch(
      "POST",
      action,
      params,
      parsedBody as string | undefined,
      parsedHeaders
    );
  };

  /**
   * A helper function for PUT.
   *
   * @async
   * @param action The path of the request. (required)
   * @param params The parameters of the request. (default: {})
   * @param body The body of te request. (optional)
   * @param headers The headers of te request. (default: {})
   */
  put = async (
    action: string,
    params: { [key: string]: string } = {},
    body: Object | string | undefined = undefined,
    headers: { [key: string]: string } = {}
  ) => {
    let parsedBody = body;
    let parsedHeaders = headers;

    if (parsedBody && !(typeof parsedBody === "string")) {
      parsedBody = JSON.stringify(parsedBody);
      parsedHeaders["Content-Type"] = "application/json";
    }

    return this.fetch(
      "PUT",
      action,
      params,
      parsedBody as string | undefined,
      parsedHeaders
    );
  };
}

const connection = new Connection();

export { connected, connection };
