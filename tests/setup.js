// Test setup file
global.chrome = {
    storage: {
        local: {
            get: jest.fn(),
            set: jest.fn()
        }
    },
    tabs: {
        query: jest.fn(),
        sendMessage: jest.fn()
    }
};

// Mock jQuery
global.$ = jest.fn(() => ({
    ready: jest.fn(),
    on: jest.fn(),
    click: jest.fn(),
    find: jest.fn(),
    text: jest.fn(),
    attr: jest.fn(),
    prop: jest.fn(),
    val: jest.fn(),
    css: jest.fn(),
    hide: jest.fn(),
    show: jest.fn(),
    addClass: jest.fn(),
    removeClass: jest.fn()
}));
