# Amysql docker image
Docker container for Amysql 
##  [Official Website](https://amh.sh/amysql.htm)
## Introduce
AMYSQL is a safe, efficient and simple MySQL database management web client (open source and free). Using AMYSQL, you can easily and efficiently complete daily MySQL data management and maintenance, including the management of databases, data tables, and user permissions. AMYSQL supports running in the PHP5~PHP8 environment. The core control program of AMYSQL is only 30 KB, the main data interaction controller file is only 2 and 10 functions, and the rest are loaded and managed in the form of static JS plug-in extension. The system simplifies the operation to the maximum extent, and the security of the program is also effectively guaranteed.

AMYSQL是一个安全高效、简易的MySQL数据库管理Web客户端 (开源免费)，使用AMYSQL可简单高效完成日常MySQL数据管理维护，包含数据库、数据表、用户权限各方面的管理。 AMYSQL支持运行于PHP5~PHP8环境，AMYSQL核心控制程序仅30余KB，主要数据交互控制器文件只有2个、10余函数，其余均为静态JS插件扩展形式载入管理，系统在最大程度简化运行的同时，程序的安全性也得到有效保证。

## Usage
Download [Config.php](https://github.com/dadafox/amysql-docker/blob/main/Config.php) from repository
Pull docker image
Edit Config.php
Start container with command:

    docker run -p 81:80 --name amysql -v ./Config.php:/var/www/html/Amysql/Config.php
