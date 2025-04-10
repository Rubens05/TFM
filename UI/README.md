TODO
    

Funcionalidad del QR
    -Generar el QR que redireccione al DPP (literalmente copiar y pegar el componente DPP LIST pero solo con el id del item que sea)
    -Poner en la lista de DPPs el QR en cada item, para que se pueda descargar (con la idea de que se ponga fisicamente en el producto)

Filtrado
    -Permitir mostrar todas las versiones de un DPP, o seleccionar varias, que las muestre de forma horizontal.
    -Permitir filtrar por fecha, mostrar las versiones que haya en el rango de fechas marcado
    -Permitir resaltar los datos que han cambiado con respecto la version anterior, o la version que se esté consultando, por ejemplo v2 y v4. La v4 que tenga marcadas los cambios con respecto la v2.

Blockchain Verts, implementar algo parecido que muestre por bloques como se va actualizando el DPP.
    Ver en modo de grafo (por así decirlo)
    Hacer cajas por versión, cada versión se une con la siguiente, cada versión tiene que tener minimo una actualización
        Hacer cajas por cada Sección
            -En caso de añadir una sección, se crea el bloque y se une a la antigua y nueva versión para mostrar la trazabilidad.
            -En caso de eliminar una sección mostrar en la siguiente versión el cuadro con color rojo o indicando que se ha eliminado
            -En caso de modificar una sección mostrarlo con un color azul indicando que se ha modificado y lo qué se ha modificado = nuevo-antiguo. También va unida a la version antigua y la nueva.
                -Añadir atributo
                -Eliminar Atributo
                -Actualizar atributo
                -Añadir documento
                -Eliminar documento
        Hacer caja por foto
            -Si se añade la primera foto, unirla a la version anterior y la nueva
            -Si se actualiza a una nueva foto relacionar la foto anterior con la foto nueva. Y relacionar la foto nueva con la versión nueva y la versión nueva--
            -Si se elimina ponerla en rojo, y unirlo solo a la versión anterior a la que se borra



