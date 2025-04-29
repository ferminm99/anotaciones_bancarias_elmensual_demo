$pathToWatch = "C:\GitRepositorios\anotaciones_elmensual\src"
$filter = "*.*"
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $pathToWatch
$watcher.Filter = $filter
$watcher.EnableRaisingEvents = $true
$watcher.IncludeSubdirectories = $true

$action = {
    Write-Host "Detected change in $($eventArgs.FullPath). Restarting frontend..."
    docker-compose restart frontend
}

Register-ObjectEvent $watcher Changed -Action $action
Register-ObjectEvent $watcher Created -Action $action
Register-ObjectEvent $watcher Deleted -Action $action
Register-ObjectEvent $watcher Renamed -Action $action

while ($true) { sleep 1 }
