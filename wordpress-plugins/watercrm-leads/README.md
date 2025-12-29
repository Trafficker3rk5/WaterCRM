# WaterCRM Lead Capture - WordPress Plugin

Create beautiful lead capture forms and send leads directly to your WaterCRM system.

## Features

- **Multiple Form Types**: Full lead form, contact form, and quick inline form
- **Automatic CRM Integration**: Leads sent directly to WaterCRM
- **Local Lead Storage**: All leads saved in WordPress database
- **Email Notifications**: Get notified of new leads
- **Spam Protection**: Built-in honeypot and basic spam filtering
- **Mobile Responsive**: Works perfectly on all devices
- **Easy to Use**: Simple shortcodes for quick implementation
- **Lead Management**: View all leads in WordPress admin

## Installation

1. Download the plugin ZIP file
2. Go to WordPress Admin > Plugins > Add New
3. Click "Upload Plugin" and select the ZIP file
4. Click "Install Now" and then "Activate"
5. Go to WaterCRM Leads > Settings to configure

## Configuration

1. Navigate to **WaterCRM Leads > Settings**
2. Enter your WaterCRM API URL
3. Enter your WaterCRM API Key
4. Set notification email address
5. Click "Save Changes"

## Shortcodes

### Full Lead Form

Complete lead capture form with all fields:

```
[watercrm_lead_form]
```

**Parameters:**
- `form_id`: Unique form identifier (default: lead_form)
- `title`: Form title (default: "Request Information")
- `submit_text`: Submit button text (default: "Send")

**Example:**

```
[watercrm_lead_form title="Get a Quote" submit_text="Request Quote"]
```

### Contact Form

Simple contact form:

```
[watercrm_contact_form]
```

**Parameters:**
- `form_id`: Unique form identifier (default: contact_form)
- `title`: Form title (default: "Contact Us")
- `submit_text`: Submit button text (default: "Send Message")

### Quick Form

Minimal inline form (name + email):

```
[watercrm_quick_form]
```

**Parameters:**
- `form_id`: Unique form identifier (default: quick_form)
- `title`: Form title (optional)
- `submit_text`: Submit button text (default: "Submit")

**Example:**

```
[watercrm_quick_form title="Subscribe" submit_text="Subscribe Now"]
```

## Lead Management

### View Leads

All submitted leads are stored in WordPress and can be viewed at:
**WaterCRM Leads > All Leads**

The admin page shows:
- Lead ID
- Name and contact information
- Status (pending, sent, failed)
- Whether sent to CRM
- Submission date

### Export Leads

Leads can be exported from the WordPress database table `wp_watercrm_leads`.

## Spam Protection

The plugin includes basic spam protection:

- **Honeypot Field**: Hidden field that bots typically fill out
- **Keyword Filtering**: Blocks common spam keywords
- **IP Tracking**: Records submitter IP address
- **User Agent Tracking**: Records browser information

## Customization

### Custom Styling

Override default styles:

```css
.watercrm-lead-form-wrapper {
    /* your custom styles */
}

.watercrm-submit-btn {
    background: #your-color;
}
```

### Form Templates

Copy template files from `watercrm-leads/templates/` to your theme under `watercrm-leads/` to customize HTML.

## Database

The plugin creates a table `wp_watercrm_leads` with the following fields:

- `id`: Lead ID
- `form_id`: Form identifier
- `name`: Lead name
- `email`: Lead email
- `phone`: Lead phone (optional)
- `company`: Company name (optional)
- `message`: Lead message
- `product_interest`: Product of interest (optional)
- `form_data`: Complete form data (JSON)
- `ip_address`: Submitter IP
- `user_agent`: Browser user agent
- `status`: Lead status (pending/sent/failed)
- `sent_to_crm`: Boolean flag
- `created_at`: Submission timestamp

## Requirements

- WordPress 5.0 or higher
- PHP 7.4 or higher
- Active WaterCRM installation with API access
- jQuery (included with WordPress)

## Support

For support and documentation, visit [watercrm.com](https://watercrm.com)

## Changelog

### 1.0.0
- Initial release
- Full lead form
- Contact form
- Quick inline form
- CRM integration
- Email notifications
- Local lead storage
- Admin dashboard
- Spam protection
