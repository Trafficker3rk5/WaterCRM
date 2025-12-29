<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>

</head>
<style>

    body {
        font-family:system-ui, sans-serif;
    }
    
    .page-break {
        page-break-after: always;
    }

    .container {
        width: 100%;
        padding-right: 15px;
        padding-left: 15px;
        margin-right: auto;
        margin-left: auto;
    }

    .section {
        width: 100%;
        height: 300px;
    }

    .header {
        width: 100%;
        height: auto;
        border-bottom: 4px solid #7d91f5 !important;
    }

    .title-1-right{
        font-size: 40px;
        text-align: right;
    }

    .title-2-right{
        font-size: 50px;
        text-align: right;
        font-weight: bold;
    }

    .title-1-left{
        font-size: 40px;
        text-align: left;
    }

    .title-2-left{
        font-size: 50px;
        text-align: left;
        font-weight: bold;
    }

    .header-image{
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    .header-image img {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    .row {
        display: flex;
        flex-wrap: wrap;
    }

    .row::after {
        content: "";
        clear: both;
        display: table;
    }

    .col-2 {
        width: 50%;
        float: left;
        box-sizing: border-box;
    }

    .text-primary {
        color: #021470;
    }

    .text-secondary {
        color: #7d91f5;
    }
    
    .product-image {
        width: 100%;
        height: 500px;
    }

    .product-data {
        width: 100%;
        height: 390px;
        /* border-bottom: 4px solid #7d91f5 !important;
        border-top: 4px solid #7d91f5 !important; */
    }
    
    .border-bottom {
        border-bottom: 4px solid #7d91f5 !important;
    }

    .border-top {
        border-top: 4px solid #7d91f5 !important;
    }
    .signature-image {
        position: fixed;
        bottom: 0;
        right: 0;
        width: 200px;
        margin-bottom: 20px;
    }

    /* FICHA TÉCNICA */

    .row-t {
    display: flex;
    flex-wrap: wrap;
    /* margin-right: -15px;
    margin-left: -15px; */
    }
    .row-t::after {
        content: "";
        clear: both;
        display: table;
    }

    .col-md-4-t {
    width: 33.33333%;
    /* float: left; */
}

.col-md-6-t {
    width: 50%;
    /* float:; */
}

.col-md-8-t {
    width: 66.66667%;
    float: left;
}

.col-md-12-t {
    width: 100%;
    /* float:; */
}

.clearfix{
    display:block;
    clear:both;
    content:"";
} 

.clearfix::after {
    content: "";
    clear: both;
    display: table;
}

.table {
    width: 100% !important;
    margin-bottom: 1rem !important;
    color: #212529 !important;
}

.table-striped tbody tr:nth-of-type(odd) {
    background-color: rgba(0, 0, 0, 0.05) !important;
}

.table-active {
    background-color: #26c6da !important;
    
}

.text-start-t {
    text-align: left !important;
}

    .text-muted-t {
        color: #6c757d !important;
    }

</style>
<body>
    <div class="container">
        <div style="text-align: center;">
            <img src="{{ COMPANY->logo_url }}" style="width: 50%; display: block; margin: 0 auto;">
        </div>
        @if (!empty($budget->client->logo))
        <div style="text-align: center;">
            <img src="{{ $budget->client->logo_url }}" style="width: 50%; display: block; margin: 0 auto; margin-top:30px;">
        </div>
        @endif
        <div class=""style="text-align:center; font-size: 30px; font-weight: bold; margin-top:150px">
            <span class="text-primary">Propuesta <br>
            {{ $date }}</span>
        </div>
    </div>
<div class="page-break"></div>
    <div class="container">
        <div class="section">
            <div class="header">
                <!-- <div class="header-image">
                    <img src="https://cdn-icons-png.flaticon.com/512/25/25297.png" style="width: 10%; height: auto;" alt="">
                </div> -->
                <div class="title-1-right">
                    <span class="text-secondary">La solución</span>
                </div>
                <div class="title-2-right">
                    <span class="text-primary">Ecológica</span>
                </div>
                
            </div>
            <div class="row">
                <div class="col-2">
                    <ul style="list-style-type: none; padding-left: 10px;">
                        <li class="text-secondary" style="margin-bottom: 15px; font-size: 15px;">- Agua de proximidad</li>
                        <li class="text-secondary" style="margin-bottom: 15px; font-size: 15px;">- Agua ilimitada</li>
                        <li class="text-secondary" style="margin-bottom: 15px; font-size: 15px;">- Agua libre de plásticos</li>
                    </ul>
                </div>
                <div class="col-2">
                    <ul style="list-style-type: none; padding-left: 10px;">
                        <li class="text-secondary" style="margin-bottom: 15px; font-size: 15px;">- Sin emisiones de CO2d</li>
                        <li class="text-secondary" style="margin-bottom: 15px; font-size: 15px;">- Libre de contaminantes químicos y bacterias</li>
                        <li class="text-secondary" style="margin-bottom: 15px; font-size: 15px;">- Sin contaminar el planeta</li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="section">
            <div class="header">
                <!-- <div class="header-image">
                    <img src="https://cdn-icons-png.flaticon.com/512/25/25297.png" style="width: 10%; height: auto;" alt="">
                </div> -->
                <div class="title-1-left">
                    <span class="text-secondary">Nuestras</span>
                </div>
                <div class="title-2-left">
                    <span class="text-primary">Ventajas</span>
                </div>
                
            </div>
            <div class="row">
                <div class="col-2">
                    <ul style="list-style-type: none; padding-left: 10px;">
                        <li class="text-secondary" style="margin-bottom: 15px; font-size: 15px;"><strong>-Calidad:</strong> Materiales de grado alimentario </li>
                        <li class="text-secondary" style="margin-bottom: 15px; font-size: 15px;"><strong>-Total libertad:</strong> sin horarios ni repartos</li>
                        <li class="text-secondary" style="margin-bottom: 15px; font-size: 15px;"><strong>-Higiénico y seguro:</strong> evitando el contacto físico</li>
                    </ul>
                </div>
                <div class="col-2">
                    <ul style="list-style-type: none; padding-left: 10px;">
                        <li class="text-secondary" style="margin-bottom: 15px; font-size: 15px;"><strong>- Esfuerzo cero:</strong> eliminamos las pesadas garrafas</li>
                        <li class="text-secondary" style="margin-bottom: 15px; font-size: 15px;"><strong>- Cuota fija:</strong> sin sorpresas en las facturas</li>
                        <li class="text-secondary" style="margin-bottom: 15px; font-size: 15px;"><strong>- Libre de plásticos:</strong> sin contaminar el planeta</li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="section">
            <div class="header">
                <!-- <div class="header-image">
                    <img src="https://cdn-icons-png.flaticon.com/512/25/25297.png" style="width: 10%; height: auto;" alt="">
                </div> -->
                <div class="title-1-right">
                    <span class="text-secondary">Compromiso</span>
                </div>
                <div class="title-2-right">
                    <span class="text-primary">Medioambiental</span>
                </div>
                
            </div>
            <div class="text-secondary" style="margin-top: 20px; font-size: 15px;">
                Gracias a la asociación <strong>Stoplastic</strong> su negocio quedará identificado como empresa colaboradora con el
                medio ambiente. Ofreciendo <strong>un agua libre de plásticos y sin emisiones de CO2</strong>
                , ayudando a la sostenibilidad del planeta. <br><br>
                Además todos nuestros dispensadores cumplen con la Norma <strong>UNE 149101</strong> y con el <strong>Real Decreto 3/2003 
                y 742/2013.</strong>
            </div>
        </div>
    </div>
    @php
        use App\Models\Tenant\TenantProduct; 
        use App\Models\Central\AdminCatalog;
        use App\Models\Central\SparePart;
    @endphp    

<div class="page-break"></div>
@foreach ($data as $n => $dd)
@php
    $product = $dd['product'];
    $attrs = $dd['attrs'];
    $parts = $dd['parts'];
    $mainImage = $dd['mainImage'];
    $techImage = $dd['techImage'];
@endphp
<div class="blue-bar"></div>
<div class="container" style="font-family:system-ui, sans-serif; font-size: 70.25%; padding-left: 0px ">
    <div class="header border-bottom border-5">
        <div class="row" style="justify-content: space-between;">
            <div class="col-2" style="margin-bottom: 0;">
                <h4 style="font-size:20px; margin-bottom: 0;"><span style="color: rgb(3,68,107);"><strong>FICHA TÉCNICA </strong></span>/ TECHNICAL DATA</h4>
            </div>
            <div class="col-2" style="position: relative; text-align: right; top:20px; display:none">
                <img src="https://i2.wp.com/www.citoparagon.es/wp-content/uploads/2019/10/smopyc-2020-logo-350x80.png?ssl=1" style="width: 40%; height: auto;" alt="">
            </div>
        </div>
    </div>
    
    <!-- NOMBRE Y CATEGORÍA -->
    <div class="row">
            <div class="col-md-12">
                <h4 style="font-size: 18px; margin-bottom:0; font-weight: lighter;"><span style="color: rgb(3,68,107);">{{ $product->family->name ?? '' }} </span>{{ (!empty($product->family->name_en ?? ''))  ? ' / '.$product->family->name_en : ''  }}</h4>
                <h3 style="font-size: 20px; margin-top:0; padding-right: 20px;"><span style="color: rgb(3,68,107);">{{ $product->name ?? '' }}</span> {{ (!empty($product->name_en ?? ''))  ? ' / '.$product->name_en : ''  }}</h3>
            </div>
            <div class="row">
                <div class="col-md-8" style="display: inline-block; width: 65% !important;">
                    <table class="table table-striped table-sm" style="width:100%">
                        <thead>
                            <tr class="table-active">
                                <th width="40px">Ref</th>
                                <th>Descripción / Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="padding-left: 4px;" width="40px">{{ $product->model }}</td>
                                <td style="padding-left: 4px;">{{ $product->description }}<br><span class="text-muted">{{ $product->description_en }}</span></td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="row clearfix">
                        <div class="col-md-6" style="display: inline-block; width: 45% !important;">
                            <h4 class="text-start" style="color: rgb(3,68,107);">Datos técnicos:</h4>
                            <ul style="padding-left: 15px;">
                            @foreach ($attrs as $attr)
                                @php $category = AdminCatalog::find($attr->attribute_id); @endphp
                                <li>{{ $category->name ?? '' }}{{ !empty($attr->text) ? ': ' . $attr->text : '' }}</li>
                            @endforeach
                            </ul>
                        </div>
                        <div class="col-md-6" style="float: right; width: 45% !important;">
                            <h4 class="text-start text-muted">Features:</h4>
                            <ul style="padding-left: 15px;">
                            @foreach ($attrs as $attr)
                                @php $category = AdminCatalog::find($attr->attribute_id); @endphp
                                <li>{{ $category->name_en ?? '' }}{{ !empty($attr->text_en) ? ': ' . $attr->text_en : '' }}</li>
                            @endforeach
                            </ul>
                        </div>
                        <div style="clear:both;"></div>
                        <div class="clearfix"></div>
                    </div>
                    @if (count($parts) > 0)
                    <div style="clear:both;"></div>
                    <div class="row clearfix">
                        <div class="col-md-12">
                            <h4 style="color: rgb(3,68,107); font-size: 18px; margin-bottom:0; font-weight:bold;"><strong>{{ $product->model }}</strong></h4>
                            <h3 style=" font-size: 18px; margin-top:0;"><span style="color: rgb(3,68,107);">MEMBRANA Y FILTROS </span>/ MEMBRANE AND FILTER</h3>
                            <table class="table table-striped table-sm" style="width:100%">
                                <thead>
                                    <tr class="table-active">
                                        <th>Ref</th>
                                        <th>Descripción / Description</th>
                                        <th>U.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach ($parts as $part)
                                    <tr>
                                        <td style="padding-left: 4px;">{{ $part->reference }}</td>
                                        <td style="padding-left: 4px;">{{ $part->name }}<br><span class="text-muted">{{ $part->name_en }}</span></td>
                                        <td style="padding-left: 4px; text-align: center">1</td>
                                    </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    </div>
                    @endif
                </div>
                <div class="col-md-4" style="float: right; width: 30% !important;">
                    <div class="" style="position: relative; text-align: center;">
                        @if (!empty($mainImage)) <div><img src="{{ $mainImage }}" style="max-width: 200px; height: auto; max-height: 400px" alt=""></div>@endif
                        @if (!empty($techImage)) <div><img src="{{ $techImage }}" style="width: 200px; height: auto;" alt=""></div>@endif
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<div style="page-break-after:always;"></div>
@endforeach

@foreach ($budgets as $n => $budget)
       
    @php 
    
    $products = explode(',', $budget->budget->products);
    foreach ($products as $pid){
        $prod = Product::find($pid);
        $prod->getTenantProduct();
        $model = $prod->model;

        $files = $prod->getFilesData(1); 
        $prImage = null;
            foreach ($files as $file) {
                if ($file['image_type'] == 1) {
                    $prImage = $file['img'];
                    break;
                }
            }
    }
    @endphp
    <div class="row">
        <div class="col-2" style="width: 45%">
            <div class="title-1-left">
                <span class="text-secondary">Propuesta</span>
            </div>
            <div class="title-2-left">
                <span class="text-primary"><strong>{{ $product->final_name ?? '' }}</strong></span>
            </div>
                <div class="title-1-left" style="font-size:30px">{{ $budget->getType($budget->type) }}</div>
                <div class="title-1-left text-secondary" style="margin-top: 40px; font-size: 15px;"><strong>Empresa:</strong> {{ $budget->budget->client->company_name }}</div>
        </div>
        <div class="col-2" style="width: 45%; float:right;">
            <div class="product-image">
                @if ($prImage)<img src="{{ $prImage }}" style="width: 100px; height: auto;" alt="">@endif
                <!-- <img src="https://cdn-icons-png.flaticon.com/512/25/25297.png" style="width: 60%; height: auto;" alt=""> -->
            </div>
        </div>
    </div>
    <div class="section">
        <div class="header">
            <div class="title-1-left">
                <span class="text-secondary">Modelo <span class="title-2-left text-primary">{{ $model }}</span></span>
            </div>            
        </div>
        <div class="row">
            <div class="col-2">
                <p class="text-secondary">Cuotas: {{ $budget->dues }}</p>
                <p class="text-secondary">Instalación</p>
                @if (!empty($budget->init_amount) && $budget->init_amount != 0) <p class="text-secondary">Coste Inicial</p> @endif
                @if (!empty($budget->last_amount) && $budget->last_amount != 0) <p class="text-secondary">Coste Final</p> @endif
                <p class="text-secondary">Mantenimiento</p>
                @if (!empty($budget->notes)) <p class="text-secondary">Extras</p>@endif
            </div>
            <div class="col-2">
                <p class="text-primary">
                    <strong style="{{ $budget->discount != 0 ? 'text-decoration:line-through; font-size: 80%; color: #52526ccc;' : '' }}">{{ $budget->price.'€' }} {{ $budget->iva == true ? '+ IVA' : ''}}</strong>
                    @if ($budget->discount != 0)
                    <strong>{{ round($budget->price * (100 - $budget->discount / 100), 2).'€' }} {{ $budget->iva == true ? '+ IVA' : ''}}</strong>
                    @endif
                </p>
                <p class="text-primary"><strong>{{ $budget->installation == true ? 'Incluida' : 'No Incluida '.($budget->installation_cost != 0 ? ' - '.$budget->installation_cost.' €' : '') }}</strong></p>
                @if (!empty($budget->init_amount) && $budget->init_amount != 0)<p class="text-primary"><strong>{{ $budget->init_amount }} €</strong></p> @endif
                @if (!empty($budget->last_amount) && $budget->last_amount != 0)<p class="text-primary"><strong>{{ $budget->last_amount }} €</strong></p> @endif
                <p class="text-primary"><strong>{{ $budget->maintenance == 0 ? 'No Incluido' : $budget->maintenance .' meses' }}</strong></p>
                
                @if (!empty($budget->notes)) <p class="text-primary"><strong>{{ $budget->notes }}</strong></p>@endif
            </div>
        </div>
        <div class="signature-image">
            @if (1 == 2)<img src="{{ $signature }}" style="width: 60%; height: auto;" alt="">@endif
        </div>
    </div>
    @if ($n + 1 != count($budgets))<div style="page-break-after:always;"></div>@endif
@endforeach
</body>
</html>
