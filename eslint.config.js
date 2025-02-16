import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  // Add your custom rules here~
  rules: {
    'ts/method-signature-style': ['error', 'method'],
  },
})
