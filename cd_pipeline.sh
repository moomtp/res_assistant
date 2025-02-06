# TODO: implement on product_host
cd ansible
ansible-playbook -i inventory/staging_host.yml ansible-playbooks/deploy_service.yml
# TODO: test on product_host's master node
cd ..
python3 test/test_res_assi.py 192.168.1.106
