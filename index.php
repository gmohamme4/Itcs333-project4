<?php
session_start();

$users_file = 'users.txt';
$message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = trim($_POST['password'] ?? '');

    if ($username && $password) {
        $users = file_exists($users_file) ? file($users_file, FILE_IGNORE_NEW_LINES) : [];
        foreach ($users as $user) {
            list($existingUser) = explode('|', $user);
            if ($username === $existingUser) {
                $message = "Username already exists!";
                break;
            }
        }

        if (!$message) {
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);
            file_put_contents($users_file, "$username|$hashed_password\n", FILE_APPEND);
            $message = "Registration successful! <a href='login.php'>Login here</a>";
        }
    } else {
        $message = "Please fill in both fields.";
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Register</title>
    <link rel="stylesheet" href="index.css">
</head>
<body>
    <div class="login-container">
        <h2>Register</h2>
        <form method="post">
            <input type="text" name="username" placeholder="Username" required><br><br>
            <input type="password" name="password" placeholder="Password" required><br><br>
            <button type="submit">Register</button>
        </form>
        <p><?php echo $message; ?></p>
        <p>Already have an account? <a href="login.php">Login here</a></p>
    </div>
</body>
</html>
