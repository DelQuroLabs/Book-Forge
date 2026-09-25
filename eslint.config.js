import tseslint from 'typescript-eslint';
export default tseslint.config(...tseslint.configs.recommended,{
 files:['src/**/*.{ts,tsx}','server/**/*.ts','shared/**/*.ts','tests/**/*.ts'],
 rules:{'@typescript-eslint/no-unused-vars':['warn',{argsIgnorePattern:'^_',varsIgnorePattern:'^_'}],'@typescript-eslint/no-explicit-any':'error'}
});
