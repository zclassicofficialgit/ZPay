@echo off

IF NOT EXIST %AppData%\Zclassic (
    mkdir %AppData%\Zclassic
)

IF NOT EXIST %AppData%\ZcashParams (
    mkdir %AppData%\ZcashParams
)

IF NOT EXIST %AppData%\Zclassic\zclassic.conf (
   (
gen=0
equihashsolver=tromp
listenonion=0
) > %AppData%\Zclassic\zclassic.conf

) 
