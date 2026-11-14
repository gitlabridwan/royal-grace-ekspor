# Upload to GitHub Pages

1. Extract the ZIP and open the `royal-grace-exportindo` folder.
2. In your repository, upload the contents of this folder to the branch you use for GitHub Pages. Keep `index.html`, `style.css`, `app.js`, `catalog-data.js`, `site-config.js` and the page and asset folders at that level. Keep subfolders and file names intact.
3. If you use GitHub's **Upload files** page, upload in more than one batch as needed. A Git client can commit the entire extracted folder at once.
4. When replacing an earlier copy of this site, remove `product-models.js`, `product-viewer.js`, `product-viewer.css` and the unused `vendor/three/` folder in that repository. Uploading a replacement ZIP does not remove old tracked files by itself.
5. For a repository publishing from its root, open **Settings → Pages**, choose **Deploy from a branch**, select the publishing branch and `/(root)`, then save. Open the address shown in GitHub Pages when its deployment finishes.

## Check the site

- The home page displays the rice terraces, six products and the main navigation.
- Products opens the catalog. Each **View Details** button opens its product page, and each **Download Spec Sheet** button downloads the corresponding PDF.
- The gallery opens larger photos and responds to the Previous and Next buttons.
- Each product's **Get Quote** button preselects that product in the form. The completed RFQ can be reviewed, copied, downloaded or opened as an email or WhatsApp draft.
- The phone menu, contact links and videos load from the deployed address.

Optional: set `siteUrl` in `site-config.js` to the site's final HTTPS address, including the repository path for a GitHub Pages project site. The existing default uses the URL from which the files are served.
