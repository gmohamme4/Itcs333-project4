<?php
session_start();

if (!isset($_SESSION['username'])) {
    header("Location: login.php");
    exit;
}

$username = $_SESSION['username'];
?>

<h2>Welcome, <?php echo htmlspecialchars($username); ?>!</h2>
<p>You are now logged in.</p>
<a href="logout.php">Logout</a>
 
