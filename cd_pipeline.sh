#  implement on product_host
cd ansible
ansible-playbook -i inventory/product_host.yml playbooks/deploy_service.yml
# test on product_host's master node
cd ..
python3 test/test_res_assi.py 192.168.1.106
