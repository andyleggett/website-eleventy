module.exports = function (config) {
    
    config.addPassthroughCopy("./src/images");


    return {
        dir: {
            input: 'src'
        },
        templateFormats: ['njk', 'md'],
        htmlTemplateEngine: 'njk',
        markdownTemplateEngine: 'njk',
        passthroughFileCopy: true
    };
};
