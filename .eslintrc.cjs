module.exports = {
	root: true,
	parser: "@typescript-eslint/parser",
	plugins: ["@typescript-eslint"],
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		/*
		 * Enables eslint-plugin-prettier and eslint-config-prettier.
		 * This will display prettier errors as ESLint errors. Make sure this is
		 * always the last configuration in the extends array.
		 */
		"plugin:prettier/recommended",
	],
	rules: {
		"@typescript-eslint/explicit-module-boundary-types": 0,
		"@typescript-eslint/no-non-null-assertion": 0,
		"@typescript-eslint/no-var-requires": "off",
		"@typescript-eslint/no-unused-vars": [
			"error",
			{ vars: "all", args: "none" },
		],
		"max-len": ["error", { code: 120 }],
		"prettier/prettier": [
			"error",
			{
				tabWidth: 4,
				useTabs: true,
			},
		],
		"no-constant-condition": ["error", { checkLoops: false }],
	},
};
