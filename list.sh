#!/bin/bash -x
PATH_ROOT="./rinha-de-backend-2024-q1"
PATH_PARTICIPANTES="${PATH_ROOT}/participantes"

arquivos=$(find . -type f -name "docker-compose.yml" ! -path "${PATH_PARTICIPANTES}") 
for arquivo in $arquivos; do   
    urls=$(grep -o -E 'image:(.+)$' "$arquivo" | sed 's/"//g' )  
   if [ -n "$urls" ]; then  
        echo "${arquivo}-$urls" 
   fi 
done | sort -u


