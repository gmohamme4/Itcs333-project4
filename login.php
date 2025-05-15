<?php
session_start();

if (isset($_GET['logout'])) {
    session_unset();
    session_destroy();
    header("Location: login.php");
    exit;
}

$users_file = 'users.txt';
$message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = trim($_POST['password'] ?? '');

    if ($username && $password) {
        $users = file_exists($users_file) ? file($users_file, FILE_IGNORE_NEW_LINES) : [];
        foreach ($users as $user) {
            list($storedUser, $storedHash) = explode('|', $user);
            if ($username === $storedUser && password_verify($password, $storedHash)) {
                $_SESSION['username'] = $username;
                header("Location: index.html");
                exit;
            }
        }
        $message = "Invalid username or password.";
    } else {
        $message = "Please fill in both fields.";
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Login</title>
    <link rel="stylesheet" href="index.css">
</head>
<body>
    <div class="login-container">
        <h2>Login</h2>
        <form method="post">
            <input type="text" name="username" placeholder="Username" required><br><br>
            <input type="password" name="password" placeholder="Password" required><br><br>
            <button type="submit">Login</button>
        </form>
        <p><?php echo $message; ?></p>
        <p>Don't have an account? <a href="index.php">Register here</a></p>
    </div>
</body>
</html>
