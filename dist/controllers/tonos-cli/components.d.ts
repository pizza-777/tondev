export declare const components: {
    tonoscli: {
        getSourceName(version: string): string;
        isExecutable: boolean;
        runGlobally: boolean;
        resolveVersionRegExp: RegExp;
        targetName: string;
        innerPath?: string | undefined;
        toolFolderName: string;
        name: string;
        home(): string;
        path(): string;
        adjustedPath(): string | undefined;
        run(terminal: import("../../core").Terminal, workDir: string, args: string[]): Promise<string>;
        silentRun(terminal: import("../../core").Terminal, workDir: string, args: string[]): Promise<string>;
        loadAvailableVersions(): Promise<string[]>;
        resolveVersion(_downloadedVersion: string): Promise<string>;
        getCurrentVersion(): Promise<string>;
        ensureVersion(terminal: import("../../core").Terminal, force: boolean, requiredVersion?: string | undefined): Promise<boolean>;
    };
};
//# sourceMappingURL=components.d.ts.map