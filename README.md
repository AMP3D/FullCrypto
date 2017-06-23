# FullCrypto
A simple client-side encryption suite for plain-text, HTML pages, or files. This project leverages AES and SHA256 using the [Crypto-JS](https://github.com/brix/crypto-js) library. Utilizing AES encryption, you can secure plain text or HTML markup or secure an entire file. You can also generate a SHA256 HASH for the content, so recipients of the encrypted content can validate the content source. The decrypt feature allows for displaying HTML markup within an iframe.

## Demo
View the demo on GitHub Pages: [https://amp3d.github.io/FullCrypto/](https://amp3d.github.io/FullCrypto/)

## Notes
The bower components are automatically moved to the ./www folder using a node package called [bower-installer](https://github.com/rquadling/bower-installer). The ./bower.json file has been modified to support this package with the `install` and `sources` key/values.