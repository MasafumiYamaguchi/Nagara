module.exports = function (api) {
  api.cache(true);
  
  const isTest = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;
  
  if (isTest) {
    return {
      presets: ['@babel/preset-env', '@babel/preset-react'],
      plugins: [
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-transform-flow-strip-types'
      ],
    };
  }
  
  return {
    presets: ['babel-preset-expo'],
    plugins: ['nativewind/babel'],
  };
};
