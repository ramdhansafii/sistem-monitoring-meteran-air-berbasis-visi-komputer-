<?php
/**
 * Tarif progresif PAM (contoh: PDAM Tirta示例).
 * Disesuaikan dengan golongan rumah tangga R1.
 */
function calculateBill($usageM3, $year = null) {
    $tariff = [
        ['max' => 10,  'price' => 1500,  'label' => '0 - 10 m³'],
        ['max' => 20,  'price' => 2500,  'label' => '11 - 20 m³'],
        ['max' => 30,  'price' => 4000,  'label' => '21 - 30 m³'],
        ['max' => PHP_FLOAT_MAX, 'price' => 6000, 'label' => '> 30 m³'],
    ];

    $fixedFee = 10000;
    $adminFee = 2500;

    $breakdown = [];
    $remaining = max(0.0, (float)$usageM3);
    $prev = 0;
    $usageCost = 0;

    foreach ($tariff as $tier) {
        if ($remaining <= 0) break;
        $tierSize = $tier['max'] === PHP_FLOAT_MAX ? $remaining : ($tier['max'] - $prev);
        $consumed = min($tierSize, $remaining);
        if ($consumed <= 0) continue;
        $cost = $consumed * $tier['price'];
        $breakdown[] = [
            'label' => $tier['label'],
            'usage_m3' => round($consumed, 2),
            'price_per_m3' => $tier['price'],
            'cost' => round($cost, 2),
        ];
        $usageCost += $cost;
        $remaining -= $consumed;
        $prev = $tier['max'] === PHP_FLOAT_MAX ? $prev : $tier['max'];
    }

    $total = $usageCost + $fixedFee + $adminFee;

    return [
        $breakdown,
        round($total, 2),
        [
            'tiers' => $tariff,
            'fixed_fee' => $fixedFee,
            'admin_fee' => $adminFee,
            'year' => (int)($year ?? date('Y')),
        ]
    ];
}
?>
