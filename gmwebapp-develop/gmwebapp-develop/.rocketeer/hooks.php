<?php

return [

    // Tasks
    //
    // Here you can define in the `before` and `after` array, Tasks to execute
    // before or after the core Rocketeer Tasks. You can either put a simple command,
    // a closure which receives a $task object, or the name of a class extending
    // the Rocketeer\Abstracts\AbstractTask class
    //
    // In the `custom` array you can list custom Tasks classes to be added
    // to Rocketeer. Those will then be available in the command line
    // with all the other tasks
    //////////////////////////////////////////////////////////////////////
    // Tasks to execute before the core Rocketeer Tasks
    'before' => [
        'setup' => [],
        'deploy' => [
            'composer selfupdate'
        ],
        'cleanup' => [],
    ],
    // Tasks to execute after the core Rocketeer Tasks
    'after' => [
        'setup' => [],
        'deploy' => [
            'mkdir -p app/cache',
            'mkdir -p app/logs',
            'rm -rf app/cache/*',
            'rm -rf app/logs/*',
            'rm -f web/app_dev.php',
            'rm -f web/appbi_dev.php',
            'chmod 777 -R app/cache/',
            'chmod 777 -R app/logs/',
            '/etc/init.d/apache2 restart'
        ],
        'cleanup' => [],
    ],
    // Custom Tasks to register with Rocketeer
    'custom' => [],
];
