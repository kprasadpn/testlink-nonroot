<?php

$tlCfg->log_path = '{{$app.installdir}}/logs/';
$g_repositoryPath = '{{$app.installdir}}/upload_area/';
$tlCfg->config_check_warning_mode = 'SCREEN';
{{#if $app.smtpEnable}}
$g_smtp_host = '{{$app.smtpHost}}';
$g_tl_admin_email = '{{$app.email}}';
$g_from_email = '{{$app.email}}';
$g_return_path_email = '{{$app.email}}';
$g_smtp_username = '{{$app.smtpUser}}';
$g_smtp_password = '{{$app.smtpPassword}}';
$g_smtp_port = '{{$app.smtpPort}}';
$g_smtp_connection_mode = '{{$app.smtpConnectionMode}}';
{{/if}}

$tlCfg->default_language = '{{$app.language}}';

?>
