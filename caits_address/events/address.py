import frappe
import requests
import json

def after_insert(doc, method):
   if doc.custom_iwapp_pincode_details:
    pincode=frappe.get_doc({
    'doctype': 'Iwapp Pincode',
    'country': doc.country,
    'pincode':doc.pincode
    })
    for i in doc.custom_iwapp_pincode_details:
        pincode.append('pincode_details',
    {
        "post_office": i.post_office,
        "taluk":i.taluk,
        "division":i.division,
        "district":i.district,
        "state":i.state
    })
    pincode.insert()
    pincode.save()
    doc.reload()

# def before_save(doc, method):
#    if doc.links:
#     for i in doc.links:
#         if i.link_doctype == "Customer":
#             cust_tax_category = frappe.db.get_value("Customer", i.link_name, 'tax_category')
#             if cust_tax_category:
#                if doc.is_primary_address == 1 or doc.is_shipping_address == 1:
#                     doc.tax_category = cust_tax_category

@frappe.whitelist()
def pincode(pin):
    if pin and len(pin)==6:
        api=f'https://api.postalpincode.in/pincode/{pin}'
        response = requests.get(api)
        if response:
            pincode = response.text
            pincode_list = json.loads(pincode)
            for i in pincode_list:
                return i.get('PostOffice')