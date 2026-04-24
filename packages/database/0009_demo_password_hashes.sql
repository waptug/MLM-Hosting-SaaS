UPDATE users
SET
  password_hash = CASE email
    WHEN 'owner@example.com' THEN 'scrypt$16384$8$1$959fc91fe5609c6de5c0261c4d7f36d6$3b57554f03256bd01f0959560b96e82b4e391c6cb153da8385ceaed970001e323c44e4aae6505718c4a3f6dfe9d3fe53c29409c143bb88ea7afa6bf0e351a356'
    WHEN 'manager@example.com' THEN 'scrypt$16384$8$1$81ed6bbc98bb86e195ca1faa56545e73$2c3608ce9596a094a956d066dca2a185139b517179699d56039a3c1e39fb798e5dcac83c73087eaf8d75b88df45984a0af7e8b7bfac4daabc9635aea5a292fd4'
    WHEN 'rep@example.com' THEN 'scrypt$16384$8$1$733721e50003a489531d8f65f34bcc5d$c41bebc059bbabf708861054a85a9e6ed1b16d1b0321a7850446a04db80d9545c650bd867c40c4175ff728cca7156eaceb45f2f9f0671573b7b7ab16c35504ca'
    ELSE password_hash
  END,
  updated_at = NOW()
WHERE email IN ('owner@example.com', 'manager@example.com', 'rep@example.com');
