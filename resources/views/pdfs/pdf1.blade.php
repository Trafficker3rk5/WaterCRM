<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>

</head>
<style>

html{margin:0;
    padding:0
}

body {
    font-family:system-ui, sans-serif;
    font-size: 70.25%;
}
.header {
    position: relative;
}

.blue-bar {
    background-color: rgb(3,68,107); /* Color de fondo azul */
    height: 20px; /* Altura de la franja */
    width: 100%; /* Ancho completo */
}
.border-bottom {
    border-bottom: 1px solid #dee2e6 !important;
}

.border-5 {
    border-width: 5px !important;
}

.d-flex {
    display: flex !important;
}
.row {
    display: flex;
    flex-wrap: wrap;
    /* margin-right: -15px;
    margin-left: -15px; */
}
.row::after {
    content: "";
    clear: both;
    display: table;
}

.col-2 {
    width: 50%;
    float: left;
    /* box-sizing: border-box; */
    /* padding-right: 15px;
    padding-left: 15px; */
}

.justify-content-between {
    justify-content: space-between !important;
}

.align-items-center {
    align-items: center !important;
}

.mb-0 {
    margin-bottom: 0 !important;
}

.text-muted {
    color: #6c757d !important;
}

.my-5 {
    margin-top: 5rem !important;
    margin-bottom: 5rem !important;
}

.col-md-4 {
    width: 33.33333%;
    /* float: left; */
}

.col-md-6 {
    width: 50%;
    /* float:; */
}

.col-md-8 {
    width: 66.66667%;
    float: left;
}

.col-md-12 {
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

.text-start {
    text-align: left !important;
}

.my-5 {
    margin-top: 5rem !important;
    margin-bottom: 5rem !important;
}

.container {
    width: 100%;
    padding-right: 30px;
    padding-left: 30px;
    margin-right: auto;
    margin-left: auto;
    
}

.header {
    width: 100%;
    height: auto;
    
}

</style>
<body>
@php use App\Models\Central\AdminCatalog; @endphp
@foreach ($data as $n => $dd)
@php
    $product = $dd['product'];
    $attrs = $dd['attrs'];
    $parts = $dd['parts'];
    $mainImage = $dd['mainImage'];
    $techImage = $dd['techImage'];
@endphp
<div class="blue-bar"></div>
<div class="container">
    <div class="header border-bottom border-5">
        <div class="row" style="justify-content: space-between;">
            <div class="col-2" style="margin-bottom: 0;">
                <h4 style="font-size:20px; margin-bottom: 0;"><span style="color: rgb(3,68,107);"><strong>FICHA TÉCNICA </strong></span>/ TECHNICAL DATA</h4>
            </div>
            <div class="col-2" style="position: relative; text-align: right; top:10px;">
                @if (defined('COMPANY'))<img src="{{ COMPANY->logo_url }}" style="height: 40px; margin-right: 80px" alt="">@endif
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
                <div class="col-md-8" style="display: inline-block;">
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
                        <div class="col-md-6" style="display: inline-block;">
                            <h4 class="text-start" style="color: rgb(3,68,107);">Datos técnicos:</h4>
                            <ul style="padding-left: 15px;">
                            @foreach ($attrs as $attr)
                                @php $category = AdminCatalog::find($attr->attribute_id); @endphp
                                <li>{{ $category->name }}{{ !empty($attr->text) ? ': ' . $attr->text : '' }}</li>
                            @endforeach
                            </ul>
                        </div>
                        <div class="col-md-6" style="float: right;">
                            <h4 class="text-start text-muted">Features:</h4>
                            <ul style="padding-left: 15px;">
                            @foreach ($attrs as $attr)
                                @php $category = AdminCatalog::find($attr->attribute_id); @endphp
                                <li>{{ $category->name_en }}{{ !empty($attr->text_en) ? ': ' . $attr->text_en : '' }}</li>
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
                <div class="col-md-4" style="float: right">
                    <div class="" style="text-align: center;">
                        @if (!empty($mainImage)) <div><img src="{{ $mainImage }}" style="max-width: 200px; height: auto; max-height: 400px" alt=""></div>@endif
                        @if (!empty($techImage)) <div><img src="{{ $techImage }}" style="width: 200px; height: auto;" alt=""></div>@endif
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@if ($n + 1 != count($data))<div style="page-break-after:always;"></div>@endif
@endforeach

</body>
</html>
