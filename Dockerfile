FROM php:7.3-apache
MAINTAINER itxcjm "2781676192@qq.com"
RUN cd /usr/src && docker-php-source extract && cd /usr/src/php/ext && docker-php-ext-install mysqli && docker-php-source delete
COPY ./src /var/www/html/
RUN chmod -R 777 /var/www/html/*
