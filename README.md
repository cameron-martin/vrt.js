# vrt.js

## Concepts

* **Backend** - Something that yields screenshots. You will have one of these for either side of the comparison. Screenshots can come from anywhere - the filesystem, S3, a browser, etc. Screenshots have an associated key, which is an arbitrary dictionary of properties. This is used to pair screenshots yielded from the "before" and "after" backend.