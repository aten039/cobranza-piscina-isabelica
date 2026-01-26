/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4187125967")

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "select1882004807",
    "maxSelect": 1,
    "name": "tipo",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "mensual",
      "opcional"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4187125967")

  // remove field
  collection.fields.removeById("select1882004807")

  return app.save(collection)
})
