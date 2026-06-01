INSERT OR IGNORE INTO fsrs_params (id, version, active, weights) VALUES (
  'default',
  1,
  1,
  json('[0.4072,1.1829,3.1262,15.4722,7.2102,0.5316,1.0651,0.0589,1.4684,0.1544,1.004,1.9813,0.0953,0.2975,2.2042,0.2407,2.9466,0.5034,0.6567]')
);

UPDATE fsrs_params SET active = 0 WHERE id != 'default';
