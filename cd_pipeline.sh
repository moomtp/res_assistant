# TODO: implement on product_host
ansible-playbook -i ansible/inventory/staging_host.yml ansible-playbooks/deploy_service.yml
# TODO: test on product_host
python3 test/test_res_assi.py 192.168.1.106
