
# Trabajo fin de Master: DPP para trazabilidad del sector lácteo

Este repositorio contiene los archivos necesarios para interactuar con una base de datos, contratos inteligentes y una red Hyperledger Besu, utilizando una arquitectura cliente-servidor.
 
## Estructura del proyecto
 
- **UI/frontend/**: Aplicación React que actúa como cliente para consumir la API.
- **UI/backend/**: Contiene el servidor backend.
- **Blockchain/hyperledger-besu-network/**: Submódulo que contiene la configuración y archivos necesarios para levantar la red Hyperledger Besu.
- **Blockchain/smart-contract/**: Contiene los contratos inteligentes utilizados en la red.
 
## Requisitos previos
 
- [Docker](https://www.docker.com/) y Docker Compose instalados.
- [Node.js](https://nodejs.org/) y npm instalados.
- Git instalado.
- [Hardhat](https://hardhat.org/) instalado globalmente o disponible localmente en el proyecto.
 
## **Instrucciones de configuración**
 
## 1. Descargar y configurar la blockchain
### 1.1 Clonar el repositorio
 
Clona este repositorio y sus submódulos:
 
```bash
git clone --recurse-submodules https://github.com/Rubens05/TFM.git
```
 
Si ya has clonado el repositorio sin los submódulos, inicialízalos con:
 
```bash
git submodule update --init --recursive
```
 
Instalar dependencias
```bash
npm install
```

### 1.2. Configuración de Hyperledger Besu
 
1. Ve al directorio `hyperledger-besu-network/config/besu/`.
2. Ejecuta el archivo `besu_setup.js` para generar los archivos de configuración de la blockchain:
 
   ```bash
   cd hyperledger-besu-network/config/besu
   node besu_setup.js
   ```
 
3. Copia la clave privada de la primera cuenta generada en `accounts/` y pégala en:
   - El archivo `hardhat.config.js` en el directorio `smart-contract/`.
   - El archivo `.env` en el directorio `backend/`.
 
### 1.3. Levantar la blockchain
 
Desde el directorio principal de `hyperledger-besu-network`, ejecuta el script `run.sh` para iniciar la red:
 
```bash
cd hyperledger-besu-network
./run.sh
```
 
### 1.4. Desplegar los contratos inteligentes
 
1. Ve al directorio `smart-contract/`.
2. Ejecuta el siguiente comando para desplegar los contratos en la red Besu:
 
   ```bash
   npx hardhat run scripts/deploy.js --network besu
   ```
 
3. Copia la dirección del contrato desplegado y pégala en el controlador `blockchainController.js` dentro del directorio `backend/` o en el .env para utilizar como variable de entorno.
 

## 2 Configuración de la Apliación Web
Una vez completada la configuración del servidor ahora levantamos el frotend y el backend


### 2.1 Construir el frontend
 
Desde el directorio `frontend/`, ejecutar el comando:
 
```bash
npm run build
```

### 2.2 Desplegar la aplicacicón

Desde el directorio `backend/`, solo si se ha ejecutado el comando anterior, lanzar el comando:

```bash
npm start
```

De esta forma la aplicación estará disponible en `http://localhost:5000` por defecto.


## 3 Uso de la Aplicación Web

Desde la interfaz gráfica se podrán realizar varas acciones:

### 3.1 Crear DPP
Pulsando el botón de crear DPP, se abrirá un formulario que permitirá rellenar diferentes secciones con atributos y valores, así como documentos e imagenes.
### 3.2 Editar DPP
Los DPPs existentes podrán ser editados mediante el mismo formulario anterior, siendo posible añadir nueva información o editar la anterior. Esta actualización generará una una versión del DPP.
### 3.3 Eliminar DPP
Los DPPs podrán ser eliminados, eliminando del mismo modo las imagenes y documentos asociados a ellos.
### 3.4 Verificar Integridad
Se puede verificar la integridad de un DPP mediante una triple verificación de hashes en la blockchain: `masterHash/`, `versionHash/` y `dynamicHash/`, si alguna de estas verificaciones falla la información del DPP se considerará no íntegra.



