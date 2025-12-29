<?php
  

namespace App\Helpers;
use App\Models\Central\SparePart;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;

class Lerph {
    public static function test()
    {
        return rand(1,1000);
    }

    public static function returnValidation($validator){
        if ($validator->fails()) {
            $msg = [];
            foreach ($validator->getMessageBag()->all() as $message) $msg[] = $message;
            return response()->json(["success" => false, "error" => $msg]);
        }

        return true;
    }

    public static function showDate($d){
        return !empty($d) && $d != '0000-00-00' ? Carbon::parse($d)->format('d/m/Y') : '';
    }

    public static function showDateTime($d){
        return !empty($d) && $d != '0000-00-00 00:00:00' ? Carbon::parse($d)->format('d/m/Y H:i') : '';
    }

    public static function parseDate($d, $format = 'd/m/Y'){
        return !empty($d) && $d != '0000-00-00 00:00:00' && $d != '0000-00-00'  ? Carbon::parse($d)->format($format) : '';
    }

    public static function showElapsedDays($d){
        if (!empty($d) && $d != '0000-00-00') {
            $now = Carbon::now();
            $date = Carbon::parse($d);
            $diff = $date->diffInDays($now);
            return $diff . ' días';
        }
        return '';
    }


    public static function showPrice($p){
        return number_format($p).'Є';
    }

    public static function diffDays($from, $to, $format = 'Y-m-d H:i:s'){
        if (empty($to) || empty($from)) return 9999;
        $to = Carbon::createFromFormat($format, $to);
        $from = Carbon::createFromFormat($format, $from);
        return $to->diffInDays($from);
    }

    public static function getDatesFromRange($start, $end, $format = 'Y-m-d'){
        $array = [];
        $interval = new \DateInterval('P1D');
        $realEnd = new \DateTime($end);
        $realEnd->add($interval);
        $period = new \DatePeriod(new \DateTime($start), $interval, $realEnd);
        foreach($period as $date) { 
            $array[] = $date->format($format); 
        }
        return $array;
      }

    public static function getMonthName($m){
        $months = ['January' => "Enero", 'February' =>"Febrero" ,'March' => "Marzo", 'April' => "Abril", 'May' => "Mayo", 'June' => "Junio", 'July' => "julio",
			'August' => "Agosto", 'September' => "Septiembre", 'October' => "Octubre", 'November' => "Noviembre", 'December' => "Diciembre"];
	    return isset($months[$m]) ? $months[$m] : '';
    }

    public static function validateCaptcha($userResponse){
        $fields_string = '';
        $fields = ['secret' => '6LcH9mwnAAAAAMrYdMwkcFb1W6w24MWWpA-WLSpA','response' => $userResponse,'remoteip' => $_SERVER['REMOTE_ADDR']];
        foreach($fields as $key=>$value) $fields_string .= $key . '=' . $value . '&';
        $fields_string = rtrim($fields_string, '&');
            
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://www.google.com/recaptcha/api/siteverify');
        curl_setopt($ch, CURLOPT_POST, count($fields));
        curl_setopt($ch, CURLOPT_POSTFIELDS, $fields_string);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, True);
        
        $result = curl_exec($ch);
        //dd($result);
        curl_close($ch);
        
        return json_decode($result, true);
    }

    public static function requireFolder($folder){
        foreach (scandir($folder) as $filename) {
            $path = $folder . '/' . $filename;
            if (is_file($path)) require $path;
        }
    }

    public static function getTenantRolName($x){
        switch($x){
            case 1:
            case 0:
                return 'Administrador';
            case 2:
                return 'Director Comercial';
            case 3:
                return 'Director Tecnicos';
            case 4:
                return 'Comerciales';
            case 5:
                return 'Técnicos';
            case 6:
                return 'Telemarketing';
        }
    }

    public static function getDues(){
        return [1, 12, 24, 36, 48, 60];
    }

    public static function getDuesSelect(){
        $dues = self::getDues();
        $items = [];
        foreach ($dues as $d) $items[] = ['label' => $d, 'value' => $d];
        return $items;
    }

    public static function getTechPdf($product){
        // PARTES
        $pids = explode(',', $product->parts);
        $parts = new Collection();
        foreach ($pids as $pid){
            if (!empty($pid)){
                $part = SparePart::find($pid);
                $parts->push($part);
            }
        }

        $files = $product->getFilesData(1);
        $mainImage = '';
        $techImage = '';
        foreach ($files as $file){
            if ($file['image_type'] == 1) $mainImage = $file['img'];
            if ($file['image_type'] == 2) $techImage = $file['img'];
        }

        if (isset($product->final_name)){
            ///Seteo el tenant data
            $product->attributes = $product->attributesActive();
            $product->name = $product->final_name;
            $product->name_en = $product->final_name;
            $product->model = $product->final_model;
            
            // Filter attributes to only include enabled ones (inner_active == 1)
            $enabledAttributes = collect($product->attributes)->filter(function($attr) {
                return isset($attr->inner_active) && $attr->inner_active == 1;
            });
        } else {
            // If not tenant product, use all attributes
            $enabledAttributes = $product->attributes ?? collect();
        }

        return [
            'product' => $product,
            'parts' => $parts,
            'attrs' => $enabledAttributes,
            'mainImage' => $mainImage,
            'techImage' => $techImage
        ];
    }
}