<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

abstract class BaseModel extends Model
{
    public $timestamps = true;
}

// este modelo permite que las demás entidades compartan la configuración de fechas created_at y updated_at.