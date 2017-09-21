"use strict";
// const path = require('path');
// const { mv } = require('broccoli-stew');
// const MergeTree = require('broccoli-merge-trees');
// const globalData = require('./build/lib/global-data');
// const FindBuildTargets = require('./build/plugins/find-build-targets');
// const CheckoutVersions = require('./build/plugins/checkout-versions');
// const ExtractTypedocs = require('./build/plugins/extract-typedocs');
// const CompileAPIDocs = require('./build/plugins/compile-api-docs');
// const CompileGuides = require('./build/plugins/compile-guides');
// const CreateVersionAliases = require('./build/plugins/create-version-aliases');
// const CompileStaticPages = require('./build/plugins/compile-static-pages');
// const stylesTree = require('./build/plugins/styles');
// export default function generateDocsFor(projectDir) {
//   let documenter = Documenter.createFor(projectDir);
//   return documenter.generate();
// }
// let typedocs = new ExtractTypedocs(versions);
// let includesDir = path.join('src', 'includes');
// let templatesDir = path.join('src', 'templates');
// let layoutsDir = path.join('src', 'layouts');
// let apidocs = new CompileAPIDocs([ typedocs, templatesDir, layoutsDir, includesDir ], config.versions);
// let guides = new CompileGuides([ versions, templatesDir, layoutsDir, includesDir ], config.versions);
// let docs = new MergeTree([ guides, apidocs ]);
// let aliases = new CreateVersionAliases(docs, config.versions);
// let pagesDir = path.join('src', 'pages');
// let pages = new CompileStaticPages([ pagesDir, layoutsDir, includesDir ]);
// let styles = stylesTree('src/styles');
// let assets = 'src/public';
// let result = new MergeTree([ docs, aliases, pages, styles, assets ]);
// module.exports = result;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLGdDQUFnQztBQUNoQywyQ0FBMkM7QUFDM0MscURBQXFEO0FBQ3JELHlEQUF5RDtBQUN6RCwwRUFBMEU7QUFDMUUseUVBQXlFO0FBQ3pFLHVFQUF1RTtBQUN2RSxzRUFBc0U7QUFDdEUsbUVBQW1FO0FBQ25FLGtGQUFrRjtBQUNsRiw4RUFBOEU7QUFDOUUsd0RBQXdEO0FBRXhELHdEQUF3RDtBQUN4RCx1REFBdUQ7QUFDdkQsa0NBQWtDO0FBQ2xDLElBQUk7QUFDSixnREFBZ0Q7QUFFaEQsa0RBQWtEO0FBQ2xELG9EQUFvRDtBQUNwRCxnREFBZ0Q7QUFFaEQsMEdBQTBHO0FBQzFHLHdHQUF3RztBQUN4RyxpREFBaUQ7QUFDakQsaUVBQWlFO0FBRWpFLDRDQUE0QztBQUM1Qyw2RUFBNkU7QUFDN0UseUNBQXlDO0FBQ3pDLDZCQUE2QjtBQUU3Qix3RUFBd0U7QUFFeEUsMkJBQTJCIiwic291cmNlc0NvbnRlbnQiOlsiLy8gY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbi8vIGNvbnN0IHsgbXYgfSA9IHJlcXVpcmUoJ2Jyb2Njb2xpLXN0ZXcnKTtcbi8vIGNvbnN0IE1lcmdlVHJlZSA9IHJlcXVpcmUoJ2Jyb2Njb2xpLW1lcmdlLXRyZWVzJyk7XG4vLyBjb25zdCBnbG9iYWxEYXRhID0gcmVxdWlyZSgnLi9idWlsZC9saWIvZ2xvYmFsLWRhdGEnKTtcbi8vIGNvbnN0IEZpbmRCdWlsZFRhcmdldHMgPSByZXF1aXJlKCcuL2J1aWxkL3BsdWdpbnMvZmluZC1idWlsZC10YXJnZXRzJyk7XG4vLyBjb25zdCBDaGVja291dFZlcnNpb25zID0gcmVxdWlyZSgnLi9idWlsZC9wbHVnaW5zL2NoZWNrb3V0LXZlcnNpb25zJyk7XG4vLyBjb25zdCBFeHRyYWN0VHlwZWRvY3MgPSByZXF1aXJlKCcuL2J1aWxkL3BsdWdpbnMvZXh0cmFjdC10eXBlZG9jcycpO1xuLy8gY29uc3QgQ29tcGlsZUFQSURvY3MgPSByZXF1aXJlKCcuL2J1aWxkL3BsdWdpbnMvY29tcGlsZS1hcGktZG9jcycpO1xuLy8gY29uc3QgQ29tcGlsZUd1aWRlcyA9IHJlcXVpcmUoJy4vYnVpbGQvcGx1Z2lucy9jb21waWxlLWd1aWRlcycpO1xuLy8gY29uc3QgQ3JlYXRlVmVyc2lvbkFsaWFzZXMgPSByZXF1aXJlKCcuL2J1aWxkL3BsdWdpbnMvY3JlYXRlLXZlcnNpb24tYWxpYXNlcycpO1xuLy8gY29uc3QgQ29tcGlsZVN0YXRpY1BhZ2VzID0gcmVxdWlyZSgnLi9idWlsZC9wbHVnaW5zL2NvbXBpbGUtc3RhdGljLXBhZ2VzJyk7XG4vLyBjb25zdCBzdHlsZXNUcmVlID0gcmVxdWlyZSgnLi9idWlsZC9wbHVnaW5zL3N0eWxlcycpO1xuXG4vLyBleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBnZW5lcmF0ZURvY3NGb3IocHJvamVjdERpcikge1xuLy8gICBsZXQgZG9jdW1lbnRlciA9IERvY3VtZW50ZXIuY3JlYXRlRm9yKHByb2plY3REaXIpO1xuLy8gICByZXR1cm4gZG9jdW1lbnRlci5nZW5lcmF0ZSgpO1xuLy8gfVxuLy8gbGV0IHR5cGVkb2NzID0gbmV3IEV4dHJhY3RUeXBlZG9jcyh2ZXJzaW9ucyk7XG5cbi8vIGxldCBpbmNsdWRlc0RpciA9IHBhdGguam9pbignc3JjJywgJ2luY2x1ZGVzJyk7XG4vLyBsZXQgdGVtcGxhdGVzRGlyID0gcGF0aC5qb2luKCdzcmMnLCAndGVtcGxhdGVzJyk7XG4vLyBsZXQgbGF5b3V0c0RpciA9IHBhdGguam9pbignc3JjJywgJ2xheW91dHMnKTtcblxuLy8gbGV0IGFwaWRvY3MgPSBuZXcgQ29tcGlsZUFQSURvY3MoWyB0eXBlZG9jcywgdGVtcGxhdGVzRGlyLCBsYXlvdXRzRGlyLCBpbmNsdWRlc0RpciBdLCBjb25maWcudmVyc2lvbnMpO1xuLy8gbGV0IGd1aWRlcyA9IG5ldyBDb21waWxlR3VpZGVzKFsgdmVyc2lvbnMsIHRlbXBsYXRlc0RpciwgbGF5b3V0c0RpciwgaW5jbHVkZXNEaXIgXSwgY29uZmlnLnZlcnNpb25zKTtcbi8vIGxldCBkb2NzID0gbmV3IE1lcmdlVHJlZShbIGd1aWRlcywgYXBpZG9jcyBdKTtcbi8vIGxldCBhbGlhc2VzID0gbmV3IENyZWF0ZVZlcnNpb25BbGlhc2VzKGRvY3MsIGNvbmZpZy52ZXJzaW9ucyk7XG5cbi8vIGxldCBwYWdlc0RpciA9IHBhdGguam9pbignc3JjJywgJ3BhZ2VzJyk7XG4vLyBsZXQgcGFnZXMgPSBuZXcgQ29tcGlsZVN0YXRpY1BhZ2VzKFsgcGFnZXNEaXIsIGxheW91dHNEaXIsIGluY2x1ZGVzRGlyIF0pO1xuLy8gbGV0IHN0eWxlcyA9IHN0eWxlc1RyZWUoJ3NyYy9zdHlsZXMnKTtcbi8vIGxldCBhc3NldHMgPSAnc3JjL3B1YmxpYyc7XG5cbi8vIGxldCByZXN1bHQgPSBuZXcgTWVyZ2VUcmVlKFsgZG9jcywgYWxpYXNlcywgcGFnZXMsIHN0eWxlcywgYXNzZXRzIF0pO1xuXG4vLyBtb2R1bGUuZXhwb3J0cyA9IHJlc3VsdDtcbiJdfQ==