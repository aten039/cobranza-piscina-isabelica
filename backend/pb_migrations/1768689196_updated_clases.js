/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1356382814")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3066534628",
    "hidden": false,
    "id": "relation1340673243",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "entrenador_id",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_343751955",
    "hidden": false,
    "id": "relation1230631354",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "horario_id",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(3, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_4187125967",
    "hidden": false,
    "id": "relation4269868922",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "recurrente_id",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1356382814")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3066534628",
    "hidden": false,
    "id": "relation1340673243",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "entrenador_id",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_343751955",
    "hidden": false,
    "id": "relation1230631354",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "horario_id",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(3, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_4187125967",
    "hidden": false,
    "id": "relation4269868922",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "recurrente_id",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
