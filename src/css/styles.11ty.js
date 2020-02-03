const fs = require('fs');
const path = require('path');
const postcss = require('postcss');

const fileName = 'styles.css';

module.exports = class {
    async data() {
        const rawFilepath = path.join(__dirname, `../_includes/css/${fileName}`);
        return {
            permalink: `css/${fileName}`,
            rawFilepath,
            rawCss: await fs.readFileSync(rawFilepath)
        };
    }

    async render({ rawCss, rawFilepath }) {
        return await postcss([require('precss'), require('postcss-import'), require('postcss-mixins'), require('postcss-color-mix'), require('postcss-discard-comments')])
            .process(rawCss, { from: rawFilepath })
            .then(result => result.css);
    }
};
