<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance as Middleware;

class PreventRequestsDuringMaintenance extends Middleware
{
    /**
     * The URIs that should be reachable while maintenance mode is enabled.
     *
     * @var array<int, string>
     */
    protected $except = [
        //
    ];

    protected function inExceptArray($request)
    {
        // Allow only Aquaam tenant domain
        if ($request->getHost() === 'aquaam.waascrm.com') {
            return true;
        }

        return parent::inExceptArray($request);
    }
}
