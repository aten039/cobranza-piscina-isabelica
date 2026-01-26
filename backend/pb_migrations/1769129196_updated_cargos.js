/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3803390126")

  // add field
  collection.fields.addAt(6, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2021218092",
    "hidden": false,
    "id": "relation365448018",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "matricula_id",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3803390126")

  // remove field
  collection.fields.removeById("relation365448018")

  return app.save(collection)
})
