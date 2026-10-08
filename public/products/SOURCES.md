# Demo image sources

Images are bundled locally so the catalog does not depend on a third-party image request at runtime.
They are examples of a product kind or category, rather than photos of the exact seeded product.

## Product examples

Source dataset: https://dummyjson.com/products
Source image host: https://cdn.dummyjson.com/product-images/

| Local files                     | Demo product                      |
| ------------------------------- | --------------------------------- |
| cup.webp, armudu.webp           | Glass                             |
| paper-cup.webp, thermo-cup.webp | Black Aluminium Cup               |
| plate.webp                      | Plate                             |
| fork.webp                       | Fork                              |
| pan.webp                        | Pan                               |
| container.webp                  | Lunch Box                         |
| kettle.webp, teapot.webp        | Silver Pot With Glass Cap         |
| napkin.webp                     | Tissue Paper Box                  |
| oil.webp                        | Cooking Oil                       |
| jar.webp                        | Honey Jar                         |
| sack.webp                       | Rice                              |
| bottle.webp                     | Water                             |
| soap.webp                       | Attitude Super Leaves Hand Soap   |
| cream.webp                      | Vaseline Men Body and Face Lotion |
| bulb.webp                       | Table Lamp                        |

## Category examples and hero

Downloaded from images.unsplash.com with the following photo identifiers:

- qab-qacaq.jpg: photo-1490312278390-ab64016e0aa9
- ev-esyalari.jpg: photo-1494438639946-1ebd1d20bf85
- qida.jpg: photo-1542838132-92c53300491e
- teserrufat.jpg: photo-1583947215259-38e31be8751f
- tekstil.jpg: photo-1600369672770-985fd30004eb
- kosmetika.jpg: photo-1608571423902-eed4a5ad8108
- elektrik.jpg: photo-1507473885765-e6ed057f782c
- tikinti.jpg: photo-1530124566582-a618bc2615dc

A merchant-uploaded image takes precedence over these examples.

## Local illustrations

Product kinds without a suitable photograph use locally generated SVG illustrations.
The reproducible source is scripts/build-product-art.mjs. Run node scripts/build-product-art.mjs to regenerate them.
These illustrations depict the product kind and are not photos of the exact seeded SKU.
