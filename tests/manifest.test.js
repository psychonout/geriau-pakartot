describe('Extension Manifest', () => {
    let manifest;

    beforeAll(() => {
        manifest = require('../src/manifest.json');
    });

    test('should have valid manifest version', () => {
        expect(manifest.manifest_version).toBe(3);
    });

    test('should have required fields', () => {
        expect(manifest.name).toBeDefined();
        expect(manifest.version).toBeDefined();
        expect(manifest.description).toBeDefined();
    });

    test('should have content scripts defined', () => {
        expect(manifest.content_scripts).toBeDefined();
        expect(Array.isArray(manifest.content_scripts)).toBe(true);
        expect(manifest.content_scripts.length).toBeGreaterThan(0);
    });

    test('should target pakartot.lt domain', () => {
        const matches = manifest.content_scripts[0].matches;
        expect(matches).toContain('https://pakartot.lt/*');
        expect(matches).toContain('https://www.pakartot.lt/*');
    });

    test('should have all required icons', () => {
        expect(manifest.icons).toBeDefined();
        expect(manifest.icons['16']).toBe('icons/icon16.png');
        expect(manifest.icons['32']).toBe('icons/icon32.png');
        expect(manifest.icons['48']).toBe('icons/icon48.png');
        expect(manifest.icons['128']).toBe('icons/icon128.png');
    });

    test('should have popup action defined', () => {
        expect(manifest.action).toBeDefined();
        expect(manifest.action.default_popup).toBe('popup.html');
    });

    test('should have required permissions', () => {
        expect(manifest.permissions).toBeDefined();
        expect(manifest.permissions).toContain('storage');
        expect(manifest.permissions).toContain('tabs');
    });

    test('should not have activeTab permission', () => {
        expect(manifest.permissions).not.toContain('activeTab');
    });
});
