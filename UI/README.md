TODO
    

Filtrado
    -Permitir resaltar los datos que han cambiado con respecto la version anterior, o la version que se esté consultando, por ejemplo v2 y v4. La v4 que tenga marcadas los cambios con respecto la v2.
    -Filtar por nombre los DPPs para linkear a otro DPP

Mejoras 
    -Poner scroll a la lista de DPPs para linkear

Blockchain Verts, implementar algo parecido que muestre por bloques como se va actualizando el DPP.
    Ver en modo de grafo (por así decirlo)
    Hacer cajas por versión, cada versión se une con la siguiente, cada versión tiene que tener minimo una actualización
        Hacer cajas por cada Sección
            -En caso de añadir una sección, se crea el bloque y se une a la antigua y nueva versión para mostrar la trazabilidad.
            -En caso de eliminar una sección mostrar en la siguiente versión el cuadro con color rojo o indicando que se ha eliminado
            -En caso de modificar una sección mostrarlo con un color azul indicando que se ha modificado y lo qué se ha modificado = nuevo-antiguo. También va unida a la versión antigua y la nueva.
                -Añadir atributo
                -Eliminar Atributo
                -Actualizar atributo
                -Añadir documento
                -Eliminar documento
        Hacer caja por foto
            -Si se añade la primera foto, unirla a la version anterior y la nueva
            -Si se actualiza a una nueva foto relacionar la foto anterior con la foto nueva. Y relacionar la foto nueva con la versión nueva y la versión nueva--
            -Si se elimina ponerla en rojo, y unirlo solo a la versión anterior a la que se borra



Control de errores:
    Cuando falle la parte de blockchain, hacer rollback y eliminar del mongo todo lo relacionado con ese DPP

Validación Blockchain
    Cambiar los hashes para que sean:
        -HashMaestro: por DPP (dinámico) según se va actualizando el DPP, este hash se actualiza según los hashes de las versiones. La primera vez se creará en función de los atributos.
        -HashVersion: por versión, se generará cada vez que se cree una versión y será creará en función de los atributos, nombre, id y fecha de actualización.
    Añadir opción de verificar integridad de una versión individual.
        Mostrar el hash calculado en tiempo real con la fecha en el momento del calculo
        Mostrar el hash guardado en la blockchain con la fecha de guardado
        Mostrar el hash guardado en la base de datos con la fecha de guardado
    Añadir opción de verificar integridad de todo el DPP completo
        1-Sacar hashMaestro de blockchain
        2-Sacar hashMaestro de bbdd
        3-Genenar el hash a partir del  
