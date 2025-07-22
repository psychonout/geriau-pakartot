describe('Package.json Validation', () => {
    let packageJson;

    beforeAll(() => {
        packageJson = require('../package.json');
    });

    test('should have valid package name', () => {
        expect(packageJson.name).toBe('geriau-pakartot');
    });

    test('should have semantic version', () => {
        const versionRegex = /^\d+\.\d+\.\d+$/;
        expect(packageJson.version).toMatch(versionRegex);
    });

    test('should have required scripts', () => {
        expect(packageJson.scripts).toBeDefined();
        expect(packageJson.scripts.lint).toBeDefined();
        expect(packageJson.scripts.build).toBeDefined();
        expect(packageJson.scripts.test).toBeDefined();
    });

    test('should have babel configuration', () => {
        expect(packageJson.babel).toBeDefined();
        expect(packageJson.babel.env.production.plugins).toContain('transform-remove-console');
    });

    test('should have required dev dependencies', () => {
        expect(packageJson.devDependencies).toBeDefined();
        expect(packageJson.devDependencies['@babel/cli']).toBeDefined();
        expect(packageJson.devDependencies['eslint']).toBeDefined();
        expect(packageJson.devDependencies['jest']).toBeDefined();
    });
});
