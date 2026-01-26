/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_124096387")

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "bool2882213148",
    "name": "activo",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_124096387")

  // remove field
  collection.fields.removeById("bool2882213148")

  return app.save(collection)
})
