interface IPathwaysClient {
    me(username: string, password?: string): Promise<Response>;
}
interface IOptions {
    baseUrl?: string;
    fetch: Function;
}
declare class PathwaysClient implements IPathwaysClient {
    private jwt;
    private options;
    private fetch;
    constructor(jwt: string, options?: IOptions);
    me: () => Promise<any>;
    private getUrl;
    private sub;
}
export default PathwaysClient;
export { IPathwaysClient, IOptions };
//# sourceMappingURL=client.d.ts.map