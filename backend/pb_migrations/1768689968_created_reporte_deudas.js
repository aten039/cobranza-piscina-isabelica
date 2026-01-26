/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": null,
    "deleteRule": null,
    "fields": [
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text3208210256",
        "max": 0,
        "min": 0,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_124096387",
        "hidden": false,
        "id": "_clone_omvY",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "atleta_id",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_4187125967",
        "hidden": false,
        "id": "_clone_DolM",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "periodo_id",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_4187125967",
        "hidden": false,
        "id": "_clone_QKJn",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "concepto_id",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "hidden": false,
        "id": "_clone_K6rd",
        "max": null,
        "min": null,
        "name": "monto_total",
        "onlyInt": false,
        "presentable": false,
        "required": true,
        "system": false,
        "type": "number"
      },
      {
        "hidden": false,
        "id": "json3856559438",
        "maxSize": 1,
        "name": "total_pagado",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "json1767021688",
        "maxSize": 1,
        "name": "saldo_pendiente",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      }
    ],
    "id": "pbc_3852812389",
    "indexes": [],
    "listRule": null,
    "name": "reporte_deudas",
    "system": false,
    "type": "view",
    "updateRule": null,
    "viewQuery": "SELECT\n  deudas.id,\n  deudas.atleta_id,\n  deudas.periodo_id,\n  deudas.concepto_id,\n  deudas.monto_total,\n  -- Aquí ocurre la magia: Suma los pagos, si no hay pagos pone 0\n  COALESCE(SUM(pagos.monto), 0) as total_pagado,\n  -- Aquí calcula la resta\n  (deudas.monto_total - COALESCE(SUM(pagos.monto), 0)) as saldo_pendiente\nFROM deudas\nLEFT JOIN pagos ON pagos.deuda_id = deudas.id\nGROUP BY deudas.id",
    "viewRule": null
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3852812389");

  return app.delete(collection);
})
