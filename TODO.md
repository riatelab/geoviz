- Faire fonction dorning qui crée un geojson points à partir d'un geojson points. Comme ça, on pourra mettre des labels dessus. 
- Faire fonctions show, hide, remove
- Modifier fonction simple pour permettre l'ajout d'attributs svg non prevus. Pour tous les paramètres non prévus dans la liste, ajouter l'attr. Faire une fonction qui convertisse fillOpacity en fill-opacity

- fiare un fonction de render png

- Pour toutes les couches, ajouter un paramètre booléen projectonthefly = true.

Si true : path = d3.geopath(projection)
Si false : parh = d3.geopath() ou je sais pas quoi.

Cela permettre de faire une fonction packcirle dans outils qui renvoie une geojson avec les coordonnées dans le plan et de l'afficher avec le layer bubble. 

Faire le même principe pour toutes les fonctions.
2 - faire layer choro. Prendre en entrée des bornes et un array de couleurs. Les méthodes de discrimination et les palettes de couleur sont en dehors de la lib.

- regler pb de position tooltip
- Faire tiles
- Faitre JSDocs
- Faire une légende
- Quand tout est stable, attaquer les symbologies
