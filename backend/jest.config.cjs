module.exports = {
    testEnvironment: 'node',
    roots: ['<rootDir>/test'],
    transform: {
        '^.+\\.tsx?$': [
            '@swc/jest',
            {
                jsc: {
                    parser: {
                        syntax: 'typescript',
                    },
                    target: 'es2022',
                },
                module: {
                    type: 'commonjs',
                },
            },
        ],
    },
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
};