#!/bin/bash

echo "sh install.sh help"
echo

if [ $1 = 'install' ]; then
    pip install -r requirements.txt
    echo '#!/bin/bash' > /usr/bin/icebox
    echo "python `pwd`/icebox.py"' $@' >> /usr/bin/icebox
    chmod +x /usr/bin/icebox

    vi ./setting.json
    exit 0
elif [ $1 = 'git' ]; then
    cd $2
    git init
    git remote add box $3
    git add .
    git commit -m "New box for $3"
    git push box +master
    cp ./git.sh $3/../
    exit 0
elif [ $1 = 'key' ]; then
    cd $HOME/.ssh/
    ssh-keygen -t rsa -C "$3"
    cat $HOME/.ssh/id_ras.pub
    chrome "https://github.com/$2/ssh-key"
    exit 0
elif [ $1 = 'help' ]; then
    echo "安装 icebox"
    echo "    sh install.sh install"
    echo "设置 Git 仓库"
    echo "    sh install.sh git <path> <mail>"
    echo "生成 ssh key"
    echo "    sh install.sh key <name> <mail>"
    exit 0
fi
