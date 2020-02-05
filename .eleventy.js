module.exports = function(config) {
    config.addPassthroughCopy('./src/images');
    config.addPassthroughCopy('./src/scripts');

    config.addPlugin(require('@11ty/eleventy-plugin-syntaxhighlight'));

    config.addFilter('dateDisplay', require('./src/_helpers/date-filter.js'));

    return {
        dir: {
            input: 'src'
        },
        templateFormats: ['njk', 'md', '11ty.js'],
        htmlTemplateEngine: 'njk',
        markdownTemplateEngine: 'njk',
        passthroughFileCopy: true
    };
};
