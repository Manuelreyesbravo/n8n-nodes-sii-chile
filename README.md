# n8n-nodes-sii-chile 🇨🇱

**Facturación Electrónica Chile para n8n** - Emite boletas, facturas y más directo al SII.

![SII Chile](https://img.shields.io/badge/SII-Chile-blue)
![n8n](https://img.shields.io/badge/n8n-community--node-orange)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Características

- ✅ **Emitir DTEs reales** al SII (Boletas, Facturas, NC, ND)
- ✅ **Validación de RUT** - Verificar, formatear, calcular DV
- ✅ **Indicadores económicos** - UF, UTM, Dólar, Euro, IPC (datos en vivo)
- ✅ **Conversión UF ↔ Pesos** automática
- ✅ **Consultar estado** de documentos emitidos
- ✅ **Soporta OpenFactura y SimpleAPI**

## 🚀 Instalación

### n8n Cloud / Desktop
1. Settings → Community Nodes
2. Buscar `n8n-nodes-sii-chile`
3. Instalar

### Self-hosted
```bash
npm install n8n-nodes-sii-chile
```

## ⚙️ Configuración

### Para emitir DTEs necesitas:

| Proveedor | Plan Gratuito | Link |
|-----------|--------------|------|
| **OpenFactura** | Sí (limitado) | [panel.openfactura.cl](https://panel.openfactura.cl) |
| **SimpleAPI** | Sí (100/mes) | [simpleapi.cl](https://simpleapi.cl) |

1. Crea cuenta en uno de los proveedores
2. Obtén tu API Key
3. Configura las credenciales en n8n

### Para funciones locales (RUT, Indicadores):
No necesitas credenciales - funcionan sin configuración.

## 📖 Uso

### Emitir Boleta Electrónica

```javascript
// Input
{
  "tipoDte": 39,
  "rutReceptor": "66666666-6",
  "items": [
    { "nombre": "Producto 1", "cantidad": 2, "precio": 10000 }
  ]
}

// Output
{
  "success": true,
  "folio": 12345,
  "tipo": 39,
  "tipoNombre": "Boleta",
  "total": 20000,
  "pdf": "https://...",
  "urlAutoservicio": "https://..."
}
```

### Emitir Factura Electrónica

```javascript
{
  "tipoDte": 33,
  "rutReceptor": "76123456-7",
  "razonSocial": "Empresa Cliente SpA",
  "giro": "Servicios de Tecnología",
  "direccion": "Av. Principal 123",
  "comuna": "Santiago",
  "items": [
    { "nombre": "Servicio Mensual", "cantidad": 1, "precio": 100000 }
  ]
}
```

### Validar RUT

```javascript
// Input: "12.345.678-5"
// Output:
{
  "valido": true,
  "rut": "12.345.678-5",
  "dv": "5",
  "mensaje": "✅ RUT válido"
}
```

### Obtener UF

```javascript
// Output:
{
  "indicador": "UF",
  "valor": 38245.76,
  "fecha": "2024-01-15",
  "unidad": "Pesos"
}
```

### Convertir UF a Pesos

```javascript
// Input: 100 UF
// Output:
{
  "uf": 100,
  "pesos": 3824576,
  "valorUf": 38245.76,
  "formateado": "$3.824.576"
}
```

## 📋 Tipos de Documento Soportados

| Código | Documento |
|--------|-----------|
| 33 | Factura Electrónica |
| 34 | Factura Exenta Electrónica |
| 39 | Boleta Electrónica |
| 41 | Boleta Exenta Electrónica |
| 61 | Nota de Crédito Electrónica |
| 56 | Nota de Débito Electrónica |

## 🔧 Operaciones Disponibles

### 📄 Emitir DTE
- Emitir Boleta
- Emitir Factura
- Emitir Nota de Crédito
- Emitir Nota de Débito

### 🔢 RUT
- Validar
- Formatear (con puntos y guión)
- Limpiar (quitar formato)
- Calcular DV
- Generar RUT aleatorio válido

### 💰 Indicadores (datos en vivo)
- Obtener todos los indicadores
- UF del día o por fecha
- UTM
- Dólar observado
- Euro
- IPC
- Convertir UF ↔ Pesos

### 📊 Consultar DTE
- Estado del documento
- Descargar PDF
- Descargar XML

## 🌐 Proveedores Soportados

### OpenFactura (Haulmer)
- El más usado en Chile
- API REST simple
- Certificación y Producción
- [Documentación](https://www.openfactura.cl/factura-electronica/api/)

### SimpleAPI
- Plan gratuito de 100 DTEs/mes
- Sin costo para pruebas
- [Documentación](https://simpleapi.cl/Productos/SimpleAPI)

## 💡 Casos de Uso

- **E-commerce**: Emitir boletas automáticamente al completar pedido
- **SaaS**: Generar facturas mensuales automáticas
- **ERP**: Integrar facturación electrónica
- **Validación**: Verificar RUT de clientes en formularios
- **Cotizaciones**: Convertir precios UF a pesos automáticamente

## 🤝 Contribuir

1. Fork el repositorio
2. Crea rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -am 'Agrega feature'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Pull Request

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE)

## 👨‍💻 Autor

**Manu** - [LatamFlows](https://latamflows.com)

Automatización para LATAM 🚀

---

**¿Necesitas una integración personalizada?** Contáctame para desarrollo de nodos custom.
